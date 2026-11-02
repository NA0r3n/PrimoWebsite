package pkg;

public class SwitchStatements {

	public static void main(String[] args) {
		
		char Grade = 'A';
		
		switch(Grade) {
		
			case 'A':
				System.out.println("Outstanding");
				break;
			case 'B':
				System.out.println("Excellent");
				break;
			case 'C':
				System.out.println("Satisfactory");
				break;
			default:
				System.out.println("Invalid Grade");
		}
	}

}
